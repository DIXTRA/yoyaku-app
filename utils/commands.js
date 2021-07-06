const moment = require('moment');

const today = moment(new Date()).format('DD/MM/YYYY');

const commands = [
  {
    name: '/yoyaku-list',
    description:
      `Usa el commando */yoyaku-list* para listar los usuarios que van a una oficina una fecha determinada.\n Ejemplo: */yoyaku-list ${today} NombreDeLaSala* para listar quienes van el día de hoy`,
  },
  {
    name: '/yoyaku',
    description: `Usa el comando */yoyaku* para agendarte para visitar la oficina. Puedes utilizar los parametros para agendarte rápidamente.\n Ejemplo: */yoyaku ${today} NombreDeLaSala* para agendarse para el día de hoy`,
  },
  {
    name: '/yoyaku-delete',
    description: `Usa este el comando */yoyaku-delete* para eliminar una visita a la oficina.\n Ejemplo: */yoyaku-delete ${today} NombreDeLaSala* para eliminar la visita para el día de hoy`,
  },
];

module.exports = { commands };
