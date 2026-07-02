import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";
import { ENTREVISTA_ESTADOS_LIST, ENTREVISTA_ESTADOS } from "../const/roles.const.js";

const entrevistaSchema = new mongoose.Schema(
  {
    familia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER_COLLECTION_NAME,
      required: true,
    },
 
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER_COLLECTION_NAME,
      default: null,
    },
   
    fecha: {
      type: Date,
      required: true,
    },
    motivo: {
      type: String,
      default: "",
    },
    estado: {
      type: String,
      enum: ENTREVISTA_ESTADOS_LIST,   
      default: ENTREVISTA_ESTADOS.PENDIENTE,
    },
    recordatorioEnviado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ENTREVISTA_COLLECTION_NAME = "Entrevista";
const Entrevista = mongoose.model(ENTREVISTA_COLLECTION_NAME, entrevistaSchema);

export default Entrevista;
