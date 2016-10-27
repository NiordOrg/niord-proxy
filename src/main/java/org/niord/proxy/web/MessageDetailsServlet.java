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
package org.niord.proxy.web;

import com.itextpdf.text.DocumentException;
import org.apache.commons.lang.StringUtils;
import org.niord.model.message.MainType;
import org.niord.model.message.MessageVo;
import org.niord.proxy.rest.MessageService;
import org.niord.proxy.util.WebUtils;
import org.w3c.dom.Document;
import org.w3c.tidy.Tidy;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * Servlet used for generating either a HTML details page
 * or a PDF for the MSI details defined by the provider and language
 * specified using request parameters.
 */
@WebServlet(urlPatterns = {"/details.pdf", "/details.html"}, asyncSupported = true)
public class MessageDetailsServlet extends HttpServlet {

    private static final String DETAILS_JSP_FILE = "/WEB-INF/jsp/details.jsp";

    @Inject
    Logger log;

    @Inject
    MessageService messageService;


    /**
     * Main GET method
     * @param request servlet request
     * @param response servlet response
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {

        // Determine whether to return HTML or PDF
        boolean pdf = request.getServletPath().endsWith("pdf");

        // Never cache the response
        response = WebUtils.nocache(response);

        // Read the request parameters
        String language = StringUtils.defaultIfBlank(request.getParameter("language"), "en");

        // Force the encoding and the locale based on the lang parameter
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        final Locale locale = new Locale(language);
        request = new HttpServletRequestWrapper(request) {
            @Override public Locale getLocale() { return locale; }
        };

        try {
            // Get the messages in the given language for the requested provider
            List<MessageVo> messages = getMessages(request, language);

            // Register the attributes to be used on the JSP page
            request.setAttribute("messages", messages);
            request.setAttribute("lang", language);
            request.setAttribute("languages", messageService.getLanguages());
            request.setAttribute("locale", locale);
            request.setAttribute("now", new Date());
            request.setAttribute("pdf", pdf);

            if (pdf) {
                generatePdfFile(request, response);
            } else {
                generateHtmlPage(request, response);
            }

        } catch (Exception e) {
            log.log(Level.SEVERE, "Error generating file " + request.getServletPath(), e);
            throw new ServletException("Error generating file " + request.getServletPath(), e);
        }
    }


    /** Gets the messages for the given search criteria **/
    List<MessageVo> getMessages(HttpServletRequest request, String language) throws Exception {

        // A specific message was requested
        if (StringUtils.isNotBlank(request.getParameter("messageId"))) {
            MessageVo message = messageService.getMessageDetails(language, request.getParameter("messageId"));
            return message == null
                    ? Collections.emptyList()
                    : Collections.singletonList(message);
        }

        // Search message based on the request parameters

        Set<MainType> mainTypes = null;
        if (StringUtils.isNotBlank(request.getParameter("mainType"))) {
            mainTypes = Arrays.stream(request.getParameterValues("mainType"))
                    .map(MainType::valueOf)
                    .collect(Collectors.toSet());
        }

        Set<Integer> areaIds = null;
        if (StringUtils.isNotBlank(request.getParameter("areaId"))) {
            areaIds = Arrays.stream(request.getParameterValues("areaId"))
                    .map(Integer::valueOf)
                    .collect(Collectors.toSet());
        }

        String wkt = request.getParameter("wkt");
        boolean active = false;
        if (StringUtils.isNotBlank(request.getParameter("active"))) {
            active = Boolean.valueOf(request.getParameter("active"));
        }

        return messageService.getMessages(language, mainTypes, areaIds, wkt, active);
    }


    /**
     * Generates a HTML page containing the MSI message details
     * @param request the HTTP servlet request
     * @param response the HTTP servlet response
     */
    private void generateHtmlPage(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        // Normal processing
        request.getRequestDispatcher(DETAILS_JSP_FILE).include(request, response);
        response.flushBuffer();
    }


    /**
     * Generates a PDF file containing the MSI message details
     * @param request the HTTP servlet request
     * @param response the HTTP servlet response
     */
    private void generatePdfFile(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        //Capture the content for this request
        ContentCaptureServletResponse capContent = new ContentCaptureServletResponse(response);
        request.getRequestDispatcher(DETAILS_JSP_FILE).include(request, capContent);

        // Check if there is content. Could be a redirect...
        if (!capContent.hasContent()) {
            return;
        }

        try {
            // Clean up the response HTML to a document that is readable by the XHTML renderer.
            String content = capContent.getContent();
            Document xhtmlContent = cleanHtml(content);

            long t0 = System.currentTimeMillis();
            String baseUri = "http://localhost:" + System.getProperty("swarm.http.port", "8080");
            log.info("Generating PDF for " + baseUri);

            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocument(xhtmlContent, baseUri);
            renderer.layout();

            response.setContentType("application/pdf");
            if (StringUtils.isNotBlank(request.getParameter("attachment"))) {
                response.setHeader("Content-Disposition", "attachment; filename=" + request.getParameter("attachment"));
            }
            OutputStream browserStream = response.getOutputStream();
            renderer.createPDF(browserStream);

            log.info("Completed PDF generation in " + (System.currentTimeMillis() - t0) + " ms");
        } catch (DocumentException e) {
            throw new ServletException(e);
        }
    }


    /**
     * Use JTidy to clean up the HTML
     * @param html the HTML to clean up
     * @return the resulting XHTML
     */
    public Document cleanHtml(String html) {
        Tidy tidy = new Tidy();

        tidy.setShowWarnings(false); //to hide errors
        tidy.setQuiet(true); //to hide warning

        tidy.setXHTML(true);
        return tidy.parseDOM(new StringReader(html), new StringWriter());
    }


    /**
     * Response wrapper
     * Collects all contents
     */
    public static class ContentCaptureServletResponse extends HttpServletResponseWrapper {

        private StringWriter contentWriter;
        private PrintWriter writer;

        /**
         * Constructor
         * @param originalResponse the original response
         */
        public ContentCaptureServletResponse(HttpServletResponse originalResponse) {
            super(originalResponse);
        }


        /**
         * {@inheritDoc}
         */
        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            throw new IllegalStateException("Call getWriter()");
        }

        /**
         * {@inheritDoc}
         */
        @Override
        public PrintWriter getWriter() throws IOException {
            if(writer == null){
                contentWriter = new StringWriter();
                writer = new PrintWriter(contentWriter);
            }
            return writer;
        }

        /**
         * Returns if the response contains content
         * @return if the response contains content
         */
        public boolean hasContent() {
            return (writer != null);
        }

        /**
         * Returns the contents of the response as a string
         * @return the contents of the response as a string
         */
        public String getContent(){
            if (writer == null) {
                return "<html/>";
            }
            writer.flush();
            return contentWriter.toString();
        }
    }
}
