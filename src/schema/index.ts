/**
 * @file Configures and exports the GraphQL schema.
 */

import builder from "./builder";

// Add types to the schema by importing their respective file, before building the schema.
import "./objects/EventObject";
import "./objects/EmailRegistrationObject";
import "./objects/PersonalInfoObject";
import "./objects/ContactInfoObject";

/**
 * The GraphQL schema built with pothos.
 */
export default builder.toSchema();
