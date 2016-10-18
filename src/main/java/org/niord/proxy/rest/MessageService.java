package org.niord.proxy.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.niord.model.message.MessageVo;
import org.niord.proxy.conf.Settings;

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
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * The main service for accessing and caching messages from the Niord Server
 */
@Singleton
@Startup
@Lock(LockType.READ)
public class MessageService {

    @Resource
    TimerService timerService;

    @Inject
    Settings settings;

    @Inject
    Logger log;

    private Cache<String, List<MessageVo>> cache = CacheBuilder.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .recordStats()
            .build();


    /** Initialize the service **/
    @PostConstruct
    private void init() {
        // Wait 0.5 seconds before fetching messages
        timerService.createSingleActionTimer(500, new TimerConfig());
    }


    /**
     * Periodically loads the published messages from the Niord server
     */
    @Timeout
    @Schedule(second = "12", minute = "*/5", hour = "*")
    public void periodicFetchMessages() {
        fetchMessages("");
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
     * Fetches messages from Niord
     * @param params the request parameters
     * @return the resulting data
     */
    public List<MessageVo> fetchMessages(String params) {

        List<MessageVo> messages = cache.getIfPresent(params);
        if (messages != null) {
            return messages;
        }

        String url = getActiveMessagesUrl() + "?" + params;
        long t0 = System.currentTimeMillis();
        try {
            URLConnection con = new URL(url).openConnection();
            con.setConnectTimeout(4000);  // 4 seconds
            con.setReadTimeout(6000);     // 6 seconds

            try (InputStream is = con.getInputStream()) {
                messages = new ObjectMapper()
                        .readValue(is, new TypeReference<List<MessageVo>>(){});

                // Cache the messages
                cache.put(params, messages);

                log.info(String.format("Loaded %d messages in %s ms from " + url,
                        messages.size(), System.currentTimeMillis() - t0));
                return messages;
            }
        } catch (Exception e) {
            log.warning("Failed loading messages from url " + url + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
