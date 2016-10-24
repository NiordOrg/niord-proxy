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
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * The main service for accessing and caching messages from the NW-NM service
 */
@Singleton
@Startup
@Lock(LockType.READ)
@SuppressWarnings("unused")
public class MessageService {

    public static final DataFilter MESSAGE_DETAILS_FILTER =
            DataFilter.get().fields("Message.details", "Message.geometry", "Area.parent", "Category.parent");

    @Inject
    Settings settings;

    @Inject
    Logger log;

    private List<MessageVo> messages = new ArrayList<>();
    private Map<String, List<Geometry>> geometries = new HashMap<>();
    private List<String> languages = new ArrayList<>();
    private List<AreaVo> areaGroups = new ArrayList<>();


    /** Initialize the service **/
    @PostConstruct
    private void init() {
        // Fetch messages from the NW-NM service
        periodicFetchMessages();
    }


    /** Returns a reference to the messages **/
    public List<MessageVo> getMessages() {
        return messages;
    }


    /** Returns the message languages **/
    public List<String> getLanguages() {
        return languages;
    }


    /** Returns the message area groups **/
    public List<AreaVo> getAreaGroups() {
        return areaGroups;
    }


    /**
     * Returns a filtered set of messages
     * @param language the language of the descriptive fields to include
     * @param mainTypes the main types to include
     * @param areaIds the area IDs of the messages to include
     * @param wkt the geometric boundary of the messages to include
     * @param active whether or not to only show messages that are currently active
     * @return the filtered set of messages
     */
    public List<MessageVo> getMessages(String language, Set<MainType> mainTypes, Set<Integer> areaIds, String wkt, boolean active) throws Exception {

        if (language != null && !languages.contains(language)) {
            language = languages.isEmpty() ? "en" : languages.get(0);
        }
        DataFilter filter = MESSAGE_DETAILS_FILTER.lang(language);

        Geometry geometry = StringUtils.isNotBlank(wkt)
                ? JtsConverter.wktToJts(wkt)
                : null;

        List<MessageVo> result = messages.stream()
                .filter(m -> filterByMainTypes(m, mainTypes))
                .filter(m -> filterByAreaIds(m, areaIds))
                .filter(m -> filterByGeometry(m, geometry))
                .filter(m -> filterByActiveStatus(m, active))
                .map(m -> m.copy(filter))
                .collect(Collectors.toList());

        log.info(String.format("Search for language=%s, mainTypes=%s, areaIds=%s, wkt=%s -> returning %d messages",
                language, mainTypes, areaIds, wkt, result.size()));

        return result;
    }


    /**
     * Returns the message with the given ID
     * @param language the language of the descriptive fields to include
     * @param messageId the ID of the message
     * @return the message with the given ID
     */
    public MessageVo getMessageDetails(String language, String messageId) {

        // First, check if the message is already cached
        MessageVo message = messages.stream()
                .filter(m -> messageId.equals(m.getId()) || messageId.equals(m.getShortId()))
                .findFirst()
                .orElse(null);


        // If not cached here, get it from the NW-NM service
        if (message == null) {
            String url = getMessageUrl(messageId);
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

                    message = mapper.readValue(json, MessageVo.class);

                    log.info(String.format(
                            "Loaded NW-NM message with ID %s in %s ms",
                            messageId,
                            System.currentTimeMillis() - t0));
                }

            } catch (Exception e) {
                log.warning("Failed loading NW-NM message with ID " + messageId + " from url " + url);
            }
        }


        if (message == null) {
            return null;
        } else {
            DataFilter filter = MESSAGE_DETAILS_FILTER.lang(language);
            return message.copy(filter);
        }
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
            return false;
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
     * Filters messages on whether they are current active or not
     * @param message the message
     * @param active if set, only include messages that are currently active
     * @return if the message is included by the filter
     */
    private boolean filterByActiveStatus(MessageVo message, boolean active) {
        if (active) {
            Date now = new Date();
            return message.getParts() != null &&
                    message.getParts().stream()
                        .filter(p -> p.getEventDates() != null)
                        .flatMap(p -> p.getEventDates().stream())
                        .anyMatch(di -> di.containsDate(now));
        }
        return true;
    }



    /**
     * Periodically loads the published messages from the Niord server
     */
    @Schedule(second = "12", minute = "*/1", hour = "*")
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


        // Update the area groups by picking the second parent-most area of each message and filter out duplicates
        List<AreaVo> areaGroups = new ArrayList<>();
        messages.stream()
                .filter(m -> m.getAreas() != null && !m.getAreas().isEmpty())
                .map(m -> m.getAreas().get(0))
                .map(a -> getParentAreaAtLevel(a, 1))
                .forEach(a -> {
                    AreaVo lastArea = areaGroups.isEmpty() ? null : areaGroups.get(areaGroups.size() - 1);
                    if (lastArea == null || !Objects.equals(lastArea.getId(), a.getId())) {
                        areaGroups.add(a);
                    }
                });



        // Ready to update our local fields
        this.messages = messages;
        this.geometries = geometries;
        this.areaGroups = areaGroups;
        this.languages = languages;
    }


    /** Return the level parent-most area **/
    private AreaVo getParentAreaAtLevel(AreaVo area, int level) {
        List<AreaVo> areaLineage = new ArrayList<>();
        for (AreaVo a = area; a != null; a = a.getParent()) {
            areaLineage.add(0, a);
        }
        return areaLineage.get(Math.min(areaLineage.size() - 1, level));
    }


    /**
     * Returns the url for fetching the list of active messages sorted by area
     * @return the list of active messages sorted by area
     */
    private String getActiveMessagesUrl() {
        return settings.getServer()
                + "/rest/public/v1/messages";
    }


    /**
     * Returns the url for fetching the public messages with the given ID
     * @return the public message with the given ID
     */
    private String getMessageUrl(String messageId) {
        try {
            return settings.getServer()
                    + "/rest/public/v1/messages/message/" + URLEncoder.encode(messageId, "utf-8");
        } catch (UnsupportedEncodingException e) {
            // Should never happen
            return null;
        }
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
