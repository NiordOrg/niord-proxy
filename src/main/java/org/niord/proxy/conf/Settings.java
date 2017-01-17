package org.niord.proxy.conf;

import org.apache.commons.lang.StringUtils;
import org.niord.proxy.rest.RootArea;

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
 *     <li>niord-proxy.areas : Comma-separated list of area-specs to use for root area filtering.
 *              The individual area-spec should have the format "areaIDorMRN|latitude|longitude|zoomLevel" with
 *              only the first part being mandatory.</li>
 *     <li>niord-proxy.repoRootPath : Path to existing Niord repo or local repo copy</li>
 *     <li>niord-proxy.repoType : either "shared" for a shared Niord repo, or "local" for a locally maintained copy</li>
 *     <li>niord-proxy.timeZone : The time-zone to use, e.g. "Europe/Copenhagen"</li>
 *     <li>niord-proxy.analyticsTrackingId : The Google Analytics tracking ID</li>
 *     <li>niord-proxy.languages : Comma-separated list of languages</li>
 *     <li>niord-proxy.executionMode : The execution mode, either "development", "test" or "production"</li>
 *     <li>niord-proxy.wmsServerUrl : A WMS server URL incl username and password. If defined, enables a proxied WMS layer.</li>
 * </ul>
 */
@Singleton
@SuppressWarnings("unused")
public class Settings {

    // The possible execution modes of Niord
    public enum ExecutionMode { DEVELOPMENT, TEST, PRODUCTION }
    public enum RepoType { LOCAL, SHARED }

    @Inject
    Logger log;

    // URL of the Niord server
    private String server;

    private RootArea[] rootAreas;

    private String repoRoot;

    private RepoType repoType;

    private String timeZone;

    private String analyticsTrackingId;

    private String[] languages;

    private ExecutionMode executionMode;

    private String wmsServerUrl;


    /** Constructor **/
    @PostConstruct
    private void init() {
        // Initialize settings from system properties

        server = System.getProperty("niord-proxy.server", "https://niord.e-navigation.net");
        log.info("server: " + server);

        String[] areaIds = System.getProperty("niord-proxy.areas", "urn:mrn:iho:country:dk").split(",");
        rootAreas = Arrays.stream(areaIds).map(RootArea::new).toArray(RootArea[]::new);
        log.info("AreaIds: " + Arrays.asList(areaIds));

        repoRoot = System.getProperty("niord-proxy.repoRootPath");
        if (StringUtils.isBlank(repoRoot)) {
            repoRoot = System.getProperty("user.home") + "/.niord-proxy/repo";
        }
        log.info("repoRoot: " + repoRoot);

        try {
            repoType = RepoType.valueOf(System.getProperty("niord-proxy.repoType").toUpperCase());
        } catch (Exception ignored) {
            repoType = RepoType.LOCAL;
        }
        log.info("repoType: " + repoType);

        timeZone = System.getProperty("niord-proxy.timeZone", "Europe/Copenhagen");
        log.info("timeZone: " + timeZone);

        analyticsTrackingId = System.getProperty("niord-proxy.analyticsTrackingId", "");
        log.info("analyticsTrackingId: " + analyticsTrackingId);

        languages = System.getProperty("niord-proxy.c", "da,en").split(",");
        log.info("languages: " + Arrays.asList(languages));

        try {
            executionMode = ExecutionMode.valueOf(System.getProperty("niord-proxy.mode").toUpperCase());
        } catch (Exception ignored) {
            executionMode = ExecutionMode.DEVELOPMENT;
        }
        log.info("mode: " + executionMode);

        wmsServerUrl = System.getProperty("niord-proxy.wmsServerUrl", "");
        log.info("wmsServerUrl: " + wmsServerUrl);
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

    public RootArea[] getRootAreas() {
        return rootAreas;
    }

    public String getRepoRoot() {
        return repoRoot;
    }

    public RepoType getRepoType() {
        return repoType;
    }

    public String[] getLanguages() {
        return languages;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public ExecutionMode getExecutionMode() {
        return executionMode;
    }

    public String getAnalyticsTrackingId() {
        return analyticsTrackingId;
    }

    public String getWmsServerUrl() {
        return wmsServerUrl;
    }
}
