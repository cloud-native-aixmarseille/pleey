import { io } from "socket.io-client";
import { API_URL } from "../config/api.config";

export const socket = io(API_URL);
