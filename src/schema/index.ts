/**
 * @file Configures and exports the GraphQL schema.
 */

import builder from "./builder.ts";

// Add types to the schema by importing their respective file, before building the schema.
import "./objects/EventObject.ts";
import "./objects/EmailRegistrationObject.ts";
import "./objects/PersonalInfoObject.ts";
import "./objects/ContactInfoObject.ts";

/**
 * The GraphQL schema built with pothos.
 */
export default builder.toSchema();
