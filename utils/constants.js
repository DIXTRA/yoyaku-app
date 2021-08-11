const SATURDAY = 'Saturday';
const SUNDAY = 'Sunday';

const isWeekend = (day) => day === SATURDAY || day === SUNDAY;

module.exports = { isWeekend };
