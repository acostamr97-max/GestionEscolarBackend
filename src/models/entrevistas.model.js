import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";
import { ENTREVISTA_ESTADOS_LIST, ENTREVISTA_ESTADOS } from "../const/roles.const.js";

/* Entrevista: una familia solicita una reunion para anotar a su hijo/a.
   La solicitud le llega al director (admin), que la programa o cancela.
   Al crearse se le puede enviar un mail de aviso al director. */
const entrevistaSchema = new mongoose.Schema(
  {
    /* Quien solicita: usuario con role 'familia' */
    familia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER_COLLECTION_NAME,
      required: true,
    },
    /* A quien le llega: el director. Puede quedar null al crearse
       si todavia no se asigno un director especifico. */
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: USER_COLLECTION_NAME,
      default: null,
    },
    /* Fecha propuesta / agendada para la entrevista */
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
      enum: ENTREVISTA_ESTADOS_LIST,   /* 'pendiente' | 'programada' | 'cancelada' */
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
