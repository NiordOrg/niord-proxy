/*
 * Copyright 2016 Danish Maritime Authority.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.niord.proxy.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.niord.model.DataFilter;
import org.niord.model.publication.PublicationVo;
import org.niord.proxy.conf.Settings;
import org.niord.proxy.util.WebUtils;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * The main service for accessing and caching publications from the NW-NM service
 */
@Singleton
@Startup
@Lock(LockType.READ)
@SuppressWarnings("unused")
public class PublicationService extends AbstractNiordService {

    @Inject
    Settings settings;

    @Inject
    Logger log;

    private List<PublicationVo> publications = new ArrayList<>();

    /** Initialize the service **/
    @PostConstruct
    private void init() {
        // Fetch publications from the NW-NM service
        periodicFetchPublications();
    }


    /** Returns a reference to the publications **/
    public List<PublicationVo> getPublications() {
        return publications;
    }


    /**
     * Returns a filtered set of the cached active publications
     * @param language the language of the descriptive fields to include
     * @return the filtered set of publications
     */
    public List<PublicationVo> getPublications(String language) {

        language = settings.language(language);
        DataFilter filter = DataFilter.get().lang(language);

        return publications.stream()
                .map(p -> p.copy(filter))
                .collect(Collectors.toList());
    }


    /**
     * Returns a filtered set of publications from the back-end
     * @param language the language of the descriptive fields to include
     * @param from the start of the date interval to find publications from
     * @param to the end of the date interval to find publications from
     * @return the filtered set of publications
     */
    public List<PublicationVo> getPublicationsForDates(String language, Long from, Long to) {

        language = settings.language(language);

        List<PublicationVo> publications = executeNiordJsonRequest(
                getPublicationsForDatesUrl(from, to, language),
                json -> new ObjectMapper().readValue(json, new TypeReference<List<PublicationVo>>(){}));

        if (publications == null) {
            log.severe(String.format("Error searching for language=%s, from=%d, to=%d",
                    language, from, to));
            return Collections.emptyList();
        }

        log.info(String.format("Search for language=%s, from=%d, to=%d -> returning %d publications",
                language, from, to, publications.size()));

        return publications.stream()
                .map(this::checkRewriteRepoPath)
                .collect(Collectors.toList());
    }


    /**
     * Returns the publication with the given ID
     * @param language the language of the descriptive fields to include
     * @param publicationId the ID of the publication
     * @return the publication with the given ID
     */
    public PublicationVo getPublicationDetails(String language, String publicationId) {

        language = settings.language(language);

        // First, check if the publication is already cached
        PublicationVo publication = publications.stream()
                .filter(p -> publicationId.equals(p.getPublicationId()))
                .findFirst()
                .orElse(null);


        // If not cached here, get it from the NW-NM service
        if (publication == null) {

            publication = executeNiordJsonRequest(
                    getPublicationUrl(publicationId),
                    json -> new ObjectMapper().readValue(json, PublicationVo.class));

            checkRewriteRepoPath(publication);
        }


        if (publication == null) {
            return null;
        } else {
            DataFilter filter = DataFilter.get().lang(language);
            return publication.copy(filter);
        }
    }


    /**
     * Rewrite publications fetched from Niord and handle proxying of files.
     * @param publication the publication to rewrite
     * @return the updated publication
     */
    private PublicationVo checkRewriteRepoPath(PublicationVo publication) {

        if (publication != null) {
            // Replace absolute links pointing to the Niord server to local links
            publication.rewriteRepoPath(
                    settings.getServer() + "/rest/repo/file/",
                    "/rest/repo/file/"
            );
        }

        return publication;
    }


    /**
     * Periodically loads the publications from the Niord server
     */
    @Schedule(second = "42", minute = "*/5", hour = "*")
    public void periodicFetchPublications() {

        List<PublicationVo> publications = executeNiordJsonRequest(
                getActivePublicationsUrl(),
                json -> new ObjectMapper().readValue(json, new TypeReference<List<PublicationVo>>(){}));

        if (publications != null) {
            this.publications = publications.stream()
                .map(this::checkRewriteRepoPath)
                .collect(Collectors.toList());
        }
    }


    /**
     * Returns the url for fetching the list of active publications
     * @return the list of active publications
     */
    private String getActivePublicationsUrl() {
        return settings.getServer()
                + "/rest/public/v1/publications";
    }


    /**
     * Returns the url for fetching the list of active publications
     * @return the list of active publications
     */
    private String getPublicationsForDatesUrl(Long from, Long to, String language) {
        String params = "lang=" + language;
        if (from != null) {
            params += "&from=" + from;
        }
        if (to != null) {
            params += "&to=" + to;
        }
        return settings.getServer()
                + "/rest/public/v1/publications?" + params;
    }

    /**
     * Returns the url for fetching the public publications with the given ID
     * @return the url for the publication with the given ID
     */
    private String getPublicationUrl(String publicationId) {
        return settings.getServer()
                + "/rest/public/v1/publication/" + WebUtils.encodeURIComponent(publicationId);
    }

}
