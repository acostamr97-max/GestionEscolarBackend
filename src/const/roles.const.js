/* Roles de usuario del sistema de gestion escolar.
   - director: actua como admin. Gestiona aulas, docentes y recibe entrevistas.
   - docente: asignado a un aula. Gestiona alumnos y asistencia de su aula.
   - familia: rol independiente. Solicita entrevistas para anotar a su hijo/a. */
export const USER_ROLES = {
  DIRECTOR: 'director',
  DOCENTE: 'docente',
  FAMILIA: 'familia'
};

/* Lista para usar en el enum de Mongoose y en validaciones */
export const USER_ROLES_LIST = Object.values(USER_ROLES);

/* Estados posibles de una entrevista */
export const ENTREVISTA_ESTADOS = {
  PENDIENTE: 'pendiente',
  PROGRAMADA: 'programada',
  CANCELADA: 'cancelada'
};

export const ENTREVISTA_ESTADOS_LIST = Object.values(ENTREVISTA_ESTADOS);

/* Estados posibles de asistencia de un alumno en una fecha */
export const ASISTENCIA_ESTADOS = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente'
};

export const ASISTENCIA_ESTADOS_LIST = Object.values(ASISTENCIA_ESTADOS);
