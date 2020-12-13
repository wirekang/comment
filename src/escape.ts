import sqlstring from 'sqlstring';

export default {
  html(str:string):string {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\n/g, '<br>');
  },
  sql(str:string):string {
    return sqlstring.escape(str);
  },
};
