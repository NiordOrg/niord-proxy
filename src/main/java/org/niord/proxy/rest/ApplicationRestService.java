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
import org.niord.proxy.conf.Settings.ExecutionMode;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;


/**
 * Main REST endpoint for fetching application specific settings
 */
@Path("/app")
public class ApplicationRestService {

    @Inject
    Settings settings;


    /**
     * Fetches the message languages
     *
     * @return the message languages
     */
    @GET
    @Path("/languages")
    @Produces("application/json;charset=UTF-8")
    public String[]  languages() {

        return settings.getLanguages();
    }


    /**
     * Returns the execution mode
     *
     * @return the execution mode
     */
    @GET
    @Path("/execution-mode")
    @Produces("application/json;charset=UTF-8")
    public ExecutionMode executionMode() {

        return settings.getExecutionMode();
    }


}