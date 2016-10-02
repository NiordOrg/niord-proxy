package org.niord.proxy.rest;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import javax.annotation.PostConstruct;
import javax.inject.Singleton;
import java.util.concurrent.TimeUnit;

/**
 * A cache for messages retrieved from the Niord Server
 */
@Singleton
public class MessageCacheService {

    Cache<String, String> cache;

    @PostConstruct
    private void init() {
        cache = CacheBuilder.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .recordStats()
                .build();
    }

    /** Returns the data associated with the given URI **/
    public String get(String uri) {
        return cache.getIfPresent(uri);
    }

    /** Sets the data associated with the given URI **/
    public void put(String uri, String data) {
        cache.put(uri, data);
    }
}
