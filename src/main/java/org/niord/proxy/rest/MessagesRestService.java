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

import org.niord.proxy.conf.Settings;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.Date;
import java.util.logging.Logger;

@Path("/messages")
public class MessagesRestService {

    private static final int CACHE_TIMEOUT_MINUTES = 3;

	@Inject
	Logger log;

	@Inject
	Settings settings;

    @Inject
    MessageCacheService messageCacheService;

	@GET
    @Path("/search")
	@Produces("application/json;charset=UTF-8")
	public Response doGet(@Context Request request, @Context UriInfo uriInfo) {

        String uri = uriInfo.getRequestUri().toString();

        String result = messageCacheService.get(uri);
        if (result == null) {
            long t0 = System.currentTimeMillis();

            Response res = ClientBuilder.newClient()
                    // TODO: Find correct timeout property
                    .property("javax.ws.rs.client.http.connectionTimeout", 4000)
                    .property("javax.ws.rs.client.http.socketTimeout", 4000)
                    .target(settings.getServer())
                    .path("public/v1/messages")
                    .queryParam("domain", "niord-client-nm")
                    .request("application/json")
                    .get();

            result = res.readEntity(String.class);
            messageCacheService.put(uri, result);
            log.info("Retrieved data for URI " + uri + " in " + (System.currentTimeMillis() - t0) + " ms");
        }

        Date expirationDate = new Date(System.currentTimeMillis() + 1000L * 60L * CACHE_TIMEOUT_MINUTES);

        // Check for an ETag match
        EntityTag etag = new EntityTag(uri + "_" + result.length() + "_" + result.hashCode(), true);
        Response.ResponseBuilder responseBuilder = request.evaluatePreconditions(etag);
        if (responseBuilder != null) {
            // ETag match
            return responseBuilder
                    .expires(expirationDate)
                    .build();
        }

        return Response
                .ok(result)
                .expires(expirationDate)
                .tag(etag)
                .build();
	}
}