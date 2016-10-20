package org.niord.proxy.rest;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

/**
 * Registers the Joda module with the ObjectMapper used for generating JSON in the REST endpoints.
 * <p>
 * This will fix the serialization of Joda DateTime used by Swagger codegen-generated NW-NM model classes
 */
@Provider
public class ObjectMapperContextResolver implements ContextResolver<ObjectMapper> {

    final ObjectMapper mapper = new ObjectMapper();

    public ObjectMapperContextResolver() {
        // Register the Joda module
        mapper.registerModule(new JodaModule())
                .setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }
}
