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

import org.niord.model.message.MainType;
import org.niord.model.message.MessageVo;

import javax.inject.Inject;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.util.List;
import java.util.Set;


/**
 * Main REST endpoint for fetching messages from the NW-NM backend
 */
@Path("/messages")
public class MessagesRestService {

    @Inject
    MessageService messageService;


    /**
     * Fetches and returns messages based on the request parameters
     *
     * @return the messages matching the request parameters
     */
	@GET
    @Path("/search")
	@Produces("application/json;charset=UTF-8")
	public List<MessageVo> search(
	        @QueryParam("lang") @DefaultValue("en") String language,
            @QueryParam("mainType") Set<MainType> mainTypes,
            @QueryParam("areaId") Set<Integer> areaIds,
            @QueryParam("wkt") String wkt) throws Exception {

        return messageService.getMessages(language, mainTypes, areaIds, wkt);
    }


    /**
     * Fetches the message languages
     *
     * @return the message languages
     */
    @GET
    @Path("/languages")
    @Produces("application/json;charset=UTF-8")
    public List<String>  languages() {

        return messageService.getLanguages();
    }

}