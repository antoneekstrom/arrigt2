import { TypeSubscriptionManager } from "@pothos/plugin-smart-subscriptions";
import { GraphQLResolveInfo } from "graphql";
import { YogaContext } from "../yoga";
import { createSubscriptionEventString } from "../model/extensions/PubSubExtension";

export function subscribeObjectType<T>(
  getId: (parent: T) => string,
  refetch: (parent: T, context: YogaContext) => Promise<T>,
) {
  return (
    subscriptions: TypeSubscriptionManager,
    parent: T,
    context: YogaContext,
    info: GraphQLResolveInfo,
  ) => {
    const updateEvent = createSubscriptionEventString(
      info.parentType.toString(),
      "update",
      getId(parent),
    );
    subscriptions.register(updateEvent, {
      refetch: () => refetch(parent, context),
    });
  };
}
