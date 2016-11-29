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

import org.niord.model.publication.PublicationVo;

import javax.inject.Inject;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.util.List;


/**
 * Main REST endpoint for fetching publications from the NW-NM backend
 */
@Path("/publications")
public class PublicationsRestService {

    @Inject
    PublicationService publicationService;


    /**
     * Returns a filtered set of publications
     *
     * @param language the language of the descriptive fields to include
     * @return the filtered set of publications
     */
	@GET
    @Path("/search")
	@Produces("application/json;charset=UTF-8")
	public List<PublicationVo> search(
	        @QueryParam("language") @DefaultValue("en") String language,
            @QueryParam("from") Long from,
            @QueryParam("to") Long to
            ) throws Exception {

        if (from != null || to != null) {
            // Get result from back-end server
            return publicationService.getPublicationsForDates(language, from, to);
        } else {
            // Get cached result
            return publicationService.getPublications(language);
        }
    }


    /**
     * Returns the publication with the given ID
     *
     * @param language the language of the descriptive fields to include
     * @param publicationId the publication ID
     * @return the publication with the given ID
     */
    @GET
    @Path("/publication/{publicationId}")
    @Produces("application/json;charset=UTF-8")
    public PublicationVo details(
            @QueryParam("language") @DefaultValue("en") String language,
            @PathParam("publicationId") String publicationId
    ) throws Exception {

        return publicationService.getPublicationDetails(language, publicationId);
    }

}