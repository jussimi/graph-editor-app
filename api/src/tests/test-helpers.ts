import { agent as request } from 'supertest';
import app from '../app';

const { SERVER_IP, UI_PORT } = process.env;
const uiHost = `http://${SERVER_IP}:${UI_PORT}`;

export interface ApiCallResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  status: number;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiCall = (body: any, headers?: Record<string, string>, route?: string) => Promise<ApiCallResponse>;

// Reusable apiCall helper that removes some boilerplate.
export const apiCall: ApiCall = async (body, headers = {}, route = '/graphql') => {
  const defaultHeaders = { Accept: 'application/json', origin: uiHost };
  const response = await request(app)
    .post(route)
    .set({ ...defaultHeaders, ...headers })
    .send(body);
  return { body: response.body, status: response.status };
};
