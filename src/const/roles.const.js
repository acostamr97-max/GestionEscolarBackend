/* Roles de usuario del sistema de gestion escolar.
   - director-> actua como admin. Gestiona aulas, docentes y recibe entrevistas.
   - docente-> asignado a un aula. Gestiona alumnos y asistencia de su aula.
   - familia->solicita entrevistas */
export const USER_ROLES = {
  DIRECTOR: 'director',
  DOCENTE: 'docente',
  FAMILIA: 'familia'
};

export const USER_ROLES_LIST = Object.values(USER_ROLES);

export const ENTREVISTA_ESTADOS = {
  PENDIENTE: 'pendiente',
  PROGRAMADA: 'programada',
  CANCELADA: 'cancelada'
};

export const ENTREVISTA_ESTADOS_LIST = Object.values(ENTREVISTA_ESTADOS);

export const ASISTENCIA_ESTADOS = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente'
};

export const ASISTENCIA_ESTADOS_LIST = Object.values(ASISTENCIA_ESTADOS);
