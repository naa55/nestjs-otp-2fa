/* eslint-disable prettier/prettier */
import { Twilio } from 'twilio';
import { constants } from './constants';

const { twilioAccountSID, twilioAuthToken, twilioPhoneNumber } = constants;
const client = new Twilio(twilioAccountSID, twilioAuthToken);

export const sendSMS = async (phone: string, message: string) => {
  try {
    const smsResponse = await client.messages.create({
      from: twilioPhoneNumber,
      to: phone,
      body: message,
    });
    return smsResponse.sid
    // console.log(smsResponse.sid);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
};
