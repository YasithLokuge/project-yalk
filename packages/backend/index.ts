import { APIGatewayProxyHandler } from 'aws-lambda';
import * as _ from "lodash";

export const handler: APIGatewayProxyHandler = async (event: any) => {
    try {
        console.log(event);
        const response = {
          statusCode: 200,
          body: 'HELLO YOU ARE MY FRIEND!!!',
        };
        return response;
      } catch (err) {
        return {
          statusCode: 500,
          body: 'An error occured',
        };
      }
};