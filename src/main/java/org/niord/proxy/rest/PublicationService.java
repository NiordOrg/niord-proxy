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
import org.apache.commons.lang.StringUtils;
import org.niord.model.DataFilter;
import org.niord.model.publication.PublicationVo;
import org.niord.proxy.conf.Settings;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import java.util.ArrayList;
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
     * Returns a filtered set of publications
     * @param language the language of the descriptive fields to include
     * @return the filtered set of publications
     */
    public List<PublicationVo> getPublications(String language) {

        DataFilter filter = DataFilter.get().lang(language);

        return publications.stream()
                .map(p -> p.copy(filter))
                .collect(Collectors.toList());
    }


    /**
     * If the Niord Proxy has been initialized with a valid path to the Niord publication repository,
     * then the proxy will rewrite publications fetched from Niord and handle streaming of files.
     * @param publication the publication to rewrite
     * @return the updated publication
     */
    private PublicationVo checkRewriteRepoPath(PublicationVo publication) {

        if (publication != null && StringUtils.isNotBlank(settings.getRepoRoot())) {
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

        List<PublicationVo> publications = executeAdminRequest(
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

}
