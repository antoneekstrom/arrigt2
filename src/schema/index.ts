/**
 * @file Configures and exports the GraphQL schema. Adds types to the schema by importing their respective file, before building the schema.
 */

import builder from "./builder.ts";
import "./objects/Event.ts";
import "./objects/PersonalInfo.ts";
import "./objects/ContactInfo.ts";
import "./objects/EmailRegistration.ts";

/**
 * The GraphQL schema built with pothos.
 */
export default builder.toSchema();
