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

import org.niord.model.message.MessageVo;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;


/**
 * Main REST endpoint for fetching messages from the NW-NM backend
 */
@Path("/messages")
public class MessagesRestService {

    private static final int CACHE_TIMEOUT_MINUTES = 3;

	@Inject
	Logger log;

    @Inject
    MessageService messageService;


    /**
     * Fetches and returns messages based on the request parameters
     * @param request the request
     * @param uriInfo the URI info
     * @return the messages matching the request parameters
     */
	@GET
    @Path("/search")
	@Produces("application/json;charset=UTF-8")
	public Response doGet(@Context Request request, @Context UriInfo uriInfo) {

        String uri = uriInfo.getRequestUri().toString();
        String params = uri.contains("?") ? uri.substring(uri.indexOf("?") + 1) : "";

        List<MessageVo> messages = messageService.fetchMessages(params);

        Date expirationDate = new Date(System.currentTimeMillis() + 1000L * 60L * CACHE_TIMEOUT_MINUTES);

        // Check for an ETag match
        EntityTag etag = new EntityTag(uri + "_" + etagForMessages(messages), true);
        Response.ResponseBuilder responseBuilder = request.evaluatePreconditions(etag);
        if (responseBuilder != null) {
            // ETag match
            return responseBuilder
                    .expires(expirationDate)
                    .build();
        }

        return Response
                .ok(messages)
                .expires(expirationDate)
                .tag(etag)
                .build();
	}


	/** Computes a E-tag value for the message list **/
    private String etagForMessages(List<MessageVo> messages) {
        AtomicLong ts = new AtomicLong();
        messages.forEach(m -> ts.addAndGet(m.getUpdated().getTime()));
        return messages.size() + "_"+ ts;
    }

}