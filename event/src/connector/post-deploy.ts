import * as dotenv from 'dotenv';
dotenv.config();
import { logger } from '../utils/logger.utils';

import { createApiRoot } from '../client/create.client';
import { assertError, assertString } from '../utils/assert.utils';
import { createGcpPubSubProductCreateUpdateSubscription } from './actions';

const CONNECT_GCP_TOPIC_NAME_KEY = 'CONNECT_GCP_TOPIC_NAME';
const CONNECT_GCP_PROJECT_ID_KEY = 'CONNECT_GCP_PROJECT_ID';
const CONNECT_PROVIDER_KEY = 'CONNECT_PROVIDER';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  try {
    const connectProvider = properties.get(CONNECT_PROVIDER_KEY);
    assertString(connectProvider, CONNECT_PROVIDER_KEY);
    const apiRoot = createApiRoot();

    const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
    const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);
    assertString(topicName, CONNECT_GCP_TOPIC_NAME_KEY);
    assertString(projectId, CONNECT_GCP_PROJECT_ID_KEY);
    await createGcpPubSubProductCreateUpdateSubscription(
      apiRoot,
      topicName,
      projectId
    );
  } catch (error) {
    logger.error(`Error during Post Deploy: ${error.message}`)
  }
}

async function run(): Promise<void> {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
