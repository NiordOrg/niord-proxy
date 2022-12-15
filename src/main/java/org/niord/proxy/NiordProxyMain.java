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
package org.niord.proxy;

import org.niord.proxy.conf.LogConfiguration;
import org.niord.proxy.rest.RestApplication;
import org.niord.proxy.util.JtsConverter;
import org.niord.proxy.web.TldFunctions;
import org.apache.catalina.startup.Tomcat;

import java.io.File;

/**
 * Bootstrapping the Niord Proxy
 */
public class NiordProxyMain {

    public static void main(String[] args) throws Exception {

        // Instantiate a Tomcat
        String contextPath = "/";
        String webappDir = new File("src/main/webapp/").getAbsolutePath();
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(9000);
        tomcat.getConnector();

        // add the web application
        tomcat.addWebapp(contextPath, webappDir);

        // run the Tomcat
        tomcat.start();
tomcat.getServer().await();


    }

}
