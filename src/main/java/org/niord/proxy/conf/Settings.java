package org.niord.proxy.conf;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.logging.Logger;

/**
 * Defines the settings used by the Niord Proxy.
 * The following system properties can be used to initialize the settings:
 * <ul>
 *     <li>niord-proxy.server : The full URL of the back-end Niord server</li>
 * </ul>
 */
@Singleton
@SuppressWarnings("unused")
public class Settings {

    // The possible execution modes of Niord
    public enum ExecutionMode { DEVELOPMENT, TEST, PRODUCTION }

    @Inject
    Logger log;

    // URL of the Niord server
    private String server;

    private String areaId;

    private String repoRoot;

    private ExecutionMode executionMode;

    /** Constructor **/
    @PostConstruct
    private void init() {
        // Initialize settings from system properties

        server = System.getProperty("niord-proxy.server", "https://niord.e-navigation.net");
        log.info("server: " + server);

        areaId = System.getProperty("niord-proxy.area");
        log.info("AreaId: " + areaId);

        repoRoot = System.getProperty("niord-proxy.repoRootPath");
        log.info("repoRoot: " + repoRoot);

        try {
            executionMode = ExecutionMode.valueOf(System.getProperty("niord-proxy.mode"));
        } catch (Exception ignored) {
            executionMode = ExecutionMode.DEVELOPMENT;
        }
        log.info("mode: " + executionMode);
    }

    public String getServer() {
        return server;
    }

    public String getAreaId() {
        return areaId;
    }

    public String getRepoRoot() {
        return repoRoot;
    }

    public ExecutionMode getExecutionMode() {
        return executionMode;
    }
}
