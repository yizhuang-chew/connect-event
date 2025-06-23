import {
  Destination,
  GoogleCloudPubSubDestination,
} from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const PRODUCT_CREATE_UPDATE_SUBSCRIPTION_KEY =
  'connector-ProductCreateUpdateSubscription';

export async function createGcpPubSubProductCreateUpdateSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
): Promise<void> {
  const destination: GoogleCloudPubSubDestination = {
    type: 'GoogleCloudPubSub',
    topic: topicName,
    projectId,
  };
  await createSubscription(apiRoot, destination);
}

async function createSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  destination: Destination
) {
  await deleteProductCreateUpdateSubscription(apiRoot);
  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: PRODUCT_CREATE_UPDATE_SUBSCRIPTION_KEY,
        destination,
        changes: [
          {
            resourceTypeId: 'product',
          },
        ],
      },
    })
    .execute();
}

export async function deleteProductCreateUpdateSubscription(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${PRODUCT_CREATE_UPDATE_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: PRODUCT_CREATE_UPDATE_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
