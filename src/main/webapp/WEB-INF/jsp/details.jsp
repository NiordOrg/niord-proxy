<%@ page pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="/WEB-INF/tags/functions" prefix="msg" %>
<%@ taglib tagdir="/WEB-INF/tags/att"  prefix="att" %>

<html>
<fmt:setLocale value="${lang}"/>
<fmt:bundle basename="MessageDetails">
<head>
    <meta charset="utf-8" />

    <title><fmt:message key="title"/></title>
    <link rel="icon" href="/img/niord-proxy_152.png" sizes="152x152" type="image/png" />
    <link rel="apple-touch-icon" href="/img/niord-proxy_152.png" sizes="152x152" type="image/png" />

    <link rel="stylesheet" type="text/css" href="/css/details${pdf ? '-pdf' : '-html'}.css">
    <link rel="stylesheet" type="text/css" href="/css/message.css">

</head>
<body>


<c:if test="${not pdf}">
    <!-- Add language selection -->
    <div style="text-align: right; padding-top: 5px">
        <span style="margin-right: 10px">
            <a href="/details.pdf?language=${lang}" target="_blank"><img src="/img/print.png" border="0" height="16"></a>
        </span>
        <c:forEach var="l" items="${languages}">
            <span style="margin-right: 10px">
                <a href="/details.html?language=${l}"><img src="/img/flags/${l}.png" border="0" height="16"></a>
            </span>
        </c:forEach>
    </div>
</c:if>


<c:if test="${pdf}">
    <!-- PDF footer -->
    <div class="footer">
        <table width="100%">
            <tr>
                <td width="30%" align="left" valign="bottom">
                    <fmt:formatDate value="${now}" type="both" dateStyle="long" timeStyle="medium"/>
                </td>
                <td width="40%" align="center" valign="middle">
                    <img src="/img/logo.png" style="height: 1cm">
                </td>
                <td width="30%" align="right" valign="bottom">
                    <fmt:message key="page"/> <span id="pagenumber"/>&nbsp;/&nbsp;<span id="pagecount"/>
                </td>
            </tr>
        </table>
    </div>
</c:if>


<div class="message-details-list">
<table class="message-table">

    <c:set var="areaHeadingId" value="${-9999}"/>
    <c:forEach var="msg" items="${messages}">

        <c:set var="areaHeading" value="${msg:areaHeading(msg)}"/>
        <c:if test="${not empty areaHeading and areaHeadingId != areaHeading.id}">
            <c:set var="areaHeadingId" value="${areaHeading.id}"/>
            <tr>
                <td>
                    <h4 class="message-area-heading">${msg:areaLineage(areaHeading, null)}</h4>
                </td>
            </tr>
        </c:if>
        <tr>

            <td>
                <div class="message-details-item">

                    <!-- Render attachments above the message -->
                    <c:forEach var="att" items="${msg:attachments(msg, 'ABOVE')}">
                        <att:attachment att="${att}"/>
                    </c:forEach>

                    <!-- Title line -->
                    <c:if test="${msg.originalInformation}">
                        <div><b>*</b></div>
                    </c:if>
                    <c:if test="${not empty msg.shortId}">
                        <div>
                            <span class="badge label-message-id">${msg.shortId}</span>
                        </div>
                    </c:if>
                    <c:if test="${not empty msg.descs}">
                        <span class="message-title">${msg.descs[0].title}</span>
                    </c:if>

                    <table class="message-details-item-fields">

                        <!-- Reference lines -->
                        <c:if test="${not empty msg.references}">
                            <tr>
                                <th><fmt:message key="field_references"/></th>
                                <td>
                                    <c:forEach var="ref" items="${msg.references}">
                                        <div>
                                            ${ref.messageId}
                                            <c:choose>
                                                <c:when test="${ref.type == 'REPETITION'}"><fmt:message key="ref_repetition"/> </c:when>
                                                <c:when test="${ref.type == 'CANCELLATION'}"><fmt:message key="ref_cancelled"/> </c:when>
                                                <c:when test="${ref.type == 'UPDATE'}"><fmt:message key="ref_updated"/> </c:when>
                                            </c:choose>
                                            <c:if test="not empty ref.descs">
                                                - ${ref.descs[0].description}
                                            </c:if>
                                        </div>
                                    </c:forEach>
                                </td>
                            </tr>
                        </c:if>

                        <!-- Details line -->
                        <c:if test="${not empty msg.parts}">
                            <c:forEach var="part" items="${msg.parts}" varStatus="partIndex">
                                <tr>
                                    <th>
                                        <c:if test="${partIndex.first || part.type != msg.parts[partIndex.index - 1].type}">
                                            <c:choose>
                                                <c:when test="${part.type == 'DETAILS'}"><fmt:message key="part_type_details"/> </c:when>
                                                <c:when test="${part.type == 'TIME'}"><fmt:message key="part_type_time"/> </c:when>
                                                <c:when test="${part.type == 'POSITIONS'}"><fmt:message key="part_type_positions"/> </c:when>
                                                <c:when test="${part.type == 'NOTE'}"><fmt:message key="part_type_note"/> </c:when>
                                                <c:when test="${part.type == 'PROHIBITION'}"><fmt:message key="part_type_prohibition"/> </c:when>
                                                <c:when test="${part.type == 'SIGNALS'}"><fmt:message key="part_type_signals"/> </c:when>
                                            </c:choose>
                                        </c:if>
                                    </th>
                                    <td class="message-description">
                                        <c:if test="${not empty part.descs && not empty part.descs[0].subject}">
                                            <div><strong>${part.descs[0].subject}</strong></div>
                                        </c:if>
                                        <c:if test="${not empty part.descs && not empty part.descs[0].details}">
                                            <c:out value="${part.descs[0].details}" escapeXml="false"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:forEach>
                        </c:if>

                        <!-- Charts line -->
                        <c:if test="${not empty msg.charts}">
                            <tr>
                                <th><fmt:message key="field_charts"/></th>
                                <td>
                                    <c:forEach var="chart" items="${msg.charts}" varStatus="status">
                                        ${chart.chartNumber}<c:if test="${not empty chart.internationalNumber}"> (INT ${chart.internationalNumber})</c:if><c:if test="${not status.last}">, </c:if>
                                    </c:forEach>
                                </td>
                            </tr>
                        </c:if>

                        <!-- Source line -->
                        <c:if test="${not empty msg.descs and not empty msg.descs[0].source}">
                            <tr>
                                <td align="right" colspan="2">
                                    (${msg.descs[0].source})
                                </td>
                            </tr>
                        </c:if>

                    </table>

                    <!-- Render attachments below the message -->
                    <c:forEach var="att" items="${msg:attachments(msg, 'BELOW')}">
                        <att:attachment att="${att}"/>
                    </c:forEach>

                </div>
            </td>
        </tr>
    </c:forEach>
</table>
</div>

<!-- Render separate-page attachments -->
<c:forEach var="msg" items="${messages}">
    <c:forEach var="att" items="${msg:attachments(msg, 'SEPARATE_PAGE')}">
        <div class="separate-attachment-page">
            <c:set var="messageId" value="${(not empty msg.shortId) ? msg.shortId : msg.id}"/>
            <div style="margin: 1mm">
                <h4 style="color: #8f2f7b; font-size: 16px;">
                    <fmt:message key="field_attachments"/> - ${messageId}
                </h4>
            </div>
            <att:attachment att="${att}"/>
        </div>
    </c:forEach>
</c:forEach>

</body>
</fmt:bundle>
</html>

