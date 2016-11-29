package org.niord.proxy.conf;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.Arrays;
import java.util.Objects;
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

    private String[] languages;

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

        languages = System.getProperty("niord-proxy.languages", "da,en").split(",");
        log.info("languages: " + Arrays.asList(languages));

        try {
            executionMode = ExecutionMode.valueOf(System.getProperty("niord-proxy.mode").toUpperCase());
        } catch (Exception ignored) {
            executionMode = ExecutionMode.DEVELOPMENT;
        }
        log.info("mode: " + executionMode);
    }

    /**
     * Returns the language if it is valid, and defaults to a valid language
     * @param language the language to test
     * @return the language if it is valid, and defaults to a valid language
     */
    public String language(String language) {
        if (Arrays.stream(languages).anyMatch(l -> Objects.equals(l, language))) {
            return language;
        }
        return languages.length > 0 ? languages[0] : "en";
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

    public String[] getLanguages() {
        return languages;
    }

    public ExecutionMode getExecutionMode() {
        return executionMode;
    }
}
