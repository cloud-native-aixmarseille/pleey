import { io } from "socket.io-client";
import { API_URL } from "../../app/config/api.config";

export const socket = io(API_URL || undefined);
