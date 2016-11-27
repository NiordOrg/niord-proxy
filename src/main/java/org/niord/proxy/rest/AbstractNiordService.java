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

import org.apache.commons.io.IOUtils;
import org.niord.proxy.conf.Settings;

import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Base class for services accessing the NW-NM service
 */
@SuppressWarnings("unused")
public class AbstractNiordService {

    @Inject
    Settings settings;

    @Inject
    Logger log;


    /**
     * Executes a Keycloak admin request and returns the result.
     * If an error occurs, null is returned.
     *
     * @param url the Niord URL
     * @param responseHandler the response handler
     * @return the result or null in case of an error
     */
    <R> R executeAdminRequest(String url, NiordResponseHandler<R> responseHandler) {
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

                R result = responseHandler.execute(json);

                log.log(Level.FINER, String.format(
                        "Executed Niord URL %s in %s ms",
                        url,
                        System.currentTimeMillis() - t0));

                return result;
            }

        } catch (Exception e) {
            log.log(Level.SEVERE, String.format(
                    "Failed executing Niord URL %s. Error: %s",
                    url,
                    e.getMessage()));
        }
        return null;
    }


    /**
     * Creates a new connection to the given URL
     * @param url the URL
     * @return the new HTTP URL connection
     **/
    HttpURLConnection newHttpUrlConnection(String url) throws IOException {
        HttpURLConnection con = (HttpURLConnection)(new URL(url).openConnection());
        con.setRequestProperty("Accept", "application/json;charset=UTF-8");
        con.setConnectTimeout(5000); //  5 seconds
        con.setReadTimeout(10000);   // 10 seconds
        return con;
    }


    /**
     * Interface that is passed along to the executeNiordRequest() function and handles the response
     */
    interface NiordResponseHandler<R> {
        R execute(String json) throws IOException;
    }

}
