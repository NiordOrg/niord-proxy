package org.niord.proxy.rest;

import org.niord.model.IJsonSerializable;
import org.niord.model.message.AreaVo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Structure that contains all root areas and lists of sub-areas for each root area.
 * This can be used in the UI to handle message filtering.
 */
@SuppressWarnings("unused")
public class AreaGroups implements IJsonSerializable {

    List<AreaVo> rootAreas = new ArrayList<>();
    Map<Integer, List<AreaVo>> subAreas = new HashMap<>();


    public List<AreaVo> getRootAreas() {
        return rootAreas;
    }

    public void setRootAreas(List<AreaVo> rootAreas) {
        this.rootAreas = rootAreas;
    }

    public Map<Integer, List<AreaVo>> getSubAreas() {
        return subAreas;
    }

    public void setSubAreas(Map<Integer, List<AreaVo>> subAreas) {
        this.subAreas = subAreas;
    }
}
