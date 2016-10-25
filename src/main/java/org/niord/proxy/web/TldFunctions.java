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

import org.niord.model.message.AreaVo;
import org.niord.model.message.AttachmentVo;
import org.niord.model.message.AttachmentVo.AttachmentDisplayType;
import org.niord.model.message.MessageVo;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Defines a set of TLD functions that may be used on a JSP page
 */
@SuppressWarnings("unused")
public class TldFunctions {

    /**
     * Returns the area heading to display for a message
     * @param msg the message
     * @return the area heading to display for a message
     */
    public static AreaVo getAreaHeading(MessageVo msg) {
        AreaVo area = msg.getAreas() != null && !msg.getAreas().isEmpty()
                ? msg.getAreas().get(0)
                : null;
        while (area != null && area.getParent() != null && area.getParent().getParent() != null) {
            area = area.getParent();
        }
        return area;
    }


    /**
     * Returns the area lineage to display for an area. If areaHeading is defined
     * this is excluded from the lineage.
     * @param area the area
     * @param areaHeading the current area heading
     * @return the area lineage to display for an area
     */
    public static String getAreaLineage(AreaVo area, AreaVo areaHeading) {
        String result = "";
        for (; area != null && (areaHeading == null || !areaHeading.getId().equals(area.getId())); area = area.getParent()) {
            if (!area.getDescs().isEmpty()) {
                if (result.length() > 0) {
                    result = " - " + result;
                }
                result = area.getDescs().get(0).getName() + result;
            }
        }
        return result;
    }


    /**
     * Returns the attachments with the given display type.
     * @param msg the message
     * @param displayType the attachment display type
     * @return the area lineage to display for an area
     */
    public static List<AttachmentVo> getAttachmentsWithDisplayType(MessageVo msg, String displayType) {
        AttachmentDisplayType display = AttachmentDisplayType.valueOf(displayType);
        return msg.getAttachments() == null
                ? Collections.emptyList()
                : msg.getAttachments().stream()
                    .filter(a -> Objects.equals(display, a.getDisplay()))
                    .collect(Collectors.toList());
    }

}
