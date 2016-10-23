package org.niord.proxy.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vividsolutions.jts.geom.Geometry;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.niord.model.DataFilter;
import org.niord.model.message.AreaVo;
import org.niord.model.message.MainType;
import org.niord.model.message.MessageDescVo;
import org.niord.model.message.MessageVo;
import org.niord.proxy.conf.Settings;
import org.niord.proxy.util.JtsConverter;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.Timeout;
import javax.ejb.TimerConfig;
import javax.ejb.TimerService;
import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * The main service for accessing and caching messages from the Niord Server
 */
@Singleton
@Startup
@Lock(LockType.READ)
@SuppressWarnings("unused")
public class MessageService {

    public static final DataFilter MESSAGE_DETAILS_FILTER =
            DataFilter.get().fields("Message.details", "Message.geometry", "Area.parent", "Category.parent");

    @Resource
    TimerService timerService;

    @Inject
    Settings settings;

    @Inject
    Logger log;

    private List<MessageVo> messages = new ArrayList<>();
    private Map<String, List<Geometry>> geometries = new HashMap<>();
    private List<String> languages = new ArrayList<>();


    /** Initialize the service **/
    @PostConstruct
    private void init() {
        // Wait 0.5 seconds before fetching messages
        timerService.createSingleActionTimer(500, new TimerConfig());
    }


    /** Returns a reference to the messages **/
    public List<MessageVo> getMessages() {
        return messages;
    }


    /** Returns a reference to the message languages **/
    public List<String> getLanguages() {
        return languages;
    }


    /**
     * Returns a filtered set of messages
     * @param language the language of the descriptive fields to include
     * @param mainTypes the main types to include
     * @param areaIds the area IDs of the messages to include
     * @param wkt the geometric boundary of the messages to include
     * @return the filtered set of messages
     */
    public List<MessageVo> getMessages(String language, Set<MainType> mainTypes, Set<Integer> areaIds, String wkt) throws Exception {

        if (language != null && !languages.contains(language)) {
            language = languages.isEmpty() ? "en" : languages.get(0);
        }
        DataFilter filter = MESSAGE_DETAILS_FILTER.lang(language);

        Geometry geometry = StringUtils.isNotBlank(wkt)
                ? JtsConverter.wktToJts(wkt)
                : null;

        return messages.stream()
                .filter(m -> filterByMainTypes(m, mainTypes))
                .filter(m -> filterByAreaIds(m, areaIds))
                .filter(m -> filterByGeometry(m, geometry))
                .map(m -> m.copy(filter))
                .collect(Collectors.toList());
    }


    /**
     * Filters messages by their main type
     * @param message the message
     * @param mainTypes the valid main types. If mainTypes is not specified, every message is included
     * @return if the message is included by the filter
     */
    private boolean filterByMainTypes(MessageVo message, Set<MainType> mainTypes) {
        return mainTypes == null || mainTypes.isEmpty() || mainTypes.contains(message.getMainType());
    }


    /**
     * Filters messages by their areas
     * @param message the message
     * @param areaIds the areas which the message must belong to. If areaIds is not specified, every message is included
     * @return if the message is included by the filter
     */
    private boolean filterByAreaIds(MessageVo message, Set<Integer> areaIds) {
        if (areaIds != null && !areaIds.isEmpty()) {
            if (message.getAreas() == null) {
                return false;
            }
            for (AreaVo msgArea : message.getAreas()) {
                // Check the area or any of its parent areas
                do {
                    if (areaIds.contains(msgArea.getId())) {
                        return true;
                    }
                    msgArea = msgArea.getParent();
                } while (msgArea != null);
            }
        }
        // If no area IDs is specified, include the message
        return true;
    }


    /**
     * Filters messages by their geometry boundary
     * @param message the message
     * @param geometry the JTS boundary that the message must be within
     * @return if the message is included by the filter
     */
    private boolean filterByGeometry(MessageVo message, Geometry geometry) {
        if (geometry != null) {
            List<Geometry> msgGeometries = geometries.get(message.getId());
            if (msgGeometries != null) {
                return msgGeometries.stream()
                        .anyMatch(geometry::contains);
            }
        }
        return true;
    }


    /**
     * Periodically loads the published messages from the Niord server
     */
    @Timeout
    @Schedule(second = "12", minute = "*/3", hour = "*")
    public void periodicFetchMessages() {

        String url = getActiveMessagesUrl();
        long t0 = System.currentTimeMillis();

        try {
            HttpURLConnection con = newHttpUrlConnection(url);

            int status = con.getResponseCode();
            if (status == HttpURLConnection.HTTP_MOVED_TEMP
                    || status == HttpURLConnection.HTTP_MOVED_PERM
                    || status == HttpURLConnection.HTTP_SEE_OTHER) {

                // get redirect url from "location" header field
                String redirectUrl = con.getHeaderField("Location");

                // open the new connection again
                con = newHttpUrlConnection(redirectUrl);
            }

            try (InputStream is = con.getInputStream()) {

                String json = IOUtils.toString(is, Charset.forName("utf-8"));

                ObjectMapper mapper = new ObjectMapper();

                List<MessageVo> messages = mapper.readValue(json, new TypeReference<List<MessageVo>>(){});
                updateMessages(messages);

                log.info(String.format(
                        "Loaded %d NW-NM messages in %s ms",
                        messages.size(),
                        System.currentTimeMillis() - t0));
            }

        } catch (Exception e) {
            log.warning("Failed loading NW-NM messages from url " + url +" : " + e.getMessage());
        }
    }


    /**
     * Called when a new list of messages has been fetched from the NW-NM service.
     * Updates local message list and computed data such as message geometries
     * @param messages the messages
     */
    private void updateMessages(List<MessageVo> messages) {

        // Convert the message geometries to JTS geometries
        // This is a fairly expensive operation, so we only want to do it once and cache the result
        Map<String, List<Geometry>> geometries = new HashMap<>();
        messages.forEach(m -> {
            List<Geometry> messageGeometries = new ArrayList<>();
            if (m.getParts() != null) {
                m.getParts().stream()
                        .filter(p -> p.getGeometry() != null && p.getGeometry().getFeatures() != null)
                        .flatMap(p -> Arrays.stream(p.getGeometry().getFeatures()))
                        .filter(f -> f.getGeometry() != null)
                        .forEach(f -> {
                            try {
                                messageGeometries.add(JtsConverter.toJts(f.getGeometry()));
                            } catch (Exception ignored) {
                            }
                        });
            }
            if (!messageGeometries.isEmpty()) {
                geometries.put(m.getId(), messageGeometries);
            }
        });


        // Determine the languages involved
        List<String> languages = messages.stream()
                .filter(m -> m.getDescs() != null)
                .flatMap(m -> m.getDescs().stream())
                .map(MessageDescVo::getLang)
                .distinct()
                .collect(Collectors.toList());


        // Ready to update our local fields
        this.messages = messages;
        this.geometries = geometries;
        this.languages = languages;
    }


    /**
     * Returns the url for fetching the list of active messages sorted by area
     * @return the list of active messages sorted by area
     */
    private String getActiveMessagesUrl() {
        return settings.getServer()
                + "/rest/public/v1/messages";
    }


    /** Creates a new connection to the given URL **/
    private HttpURLConnection newHttpUrlConnection(String url) throws IOException {
        HttpURLConnection con = (HttpURLConnection)(new URL(url).openConnection());
        con.setRequestProperty("Accept", "application/json;charset=UTF-8");
        con.setConnectTimeout(5000); //  5 seconds
        con.setReadTimeout(10000);   // 10 seconds
        return con;
    }

}
