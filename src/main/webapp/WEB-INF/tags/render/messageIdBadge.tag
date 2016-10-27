<%@ tag body-content="empty" %>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions"%>

<%@ attribute name="msg" rtexprvalue="true" required="true" type="org.niord.model.message.MessageVo"  description="Message to render ID badge for" %>

<c:if test="${not empty msg.shortId}">
    <span class="label-message-id">${msg.shortId}</span>
</c:if>

<c:if test="${empty msg.shortId}">
    <span class="label-message-type">
        <fmt:message key="${msg.type}"/>
        <fmt:message key="${msg.mainType}"/>
    </span>
</c:if>
