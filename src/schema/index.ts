/**
 * @file Configures and exports the GraphQL schema. Adds types to the schema by importing their respective file, before building the schema.
 */

import builder from "./builder.ts";
// Adds the Event object type
import "./Event";

/**
 * The GraphQL schema built with pothos.
 */
export default builder.toSchema();
