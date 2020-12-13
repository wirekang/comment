import sqlite3 from 'sqlite3';
import escape from './escape';

interface Comment{
  aid: string
  name: string
  passwd: string
  text: string
}

interface CommentNP{
  id: number
  aid: string
  name: string
  text: string
  time: number
}

export default class DA {
  db:sqlite3.Database | undefined

  open():Promise<void> {
    return new Promise<void>((resolve) => {
      this.db = new sqlite3.Database('./db.db', (err) => {
        if (err) {
          console.error(err.message);
          resolve();
        }
        console.log('DB opened.');
        resolve();
      });
    });
  }

  insertComment(cmt: Comment): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const sql = 'INSERT INTO comments( aid,name,passwd,text,time) VALUES('
        + `${escape.sql(cmt.aid)},${escape.sql(cmt.name)},`
        + `${escape.sql(cmt.passwd)},${escape.sql(cmt.text)}`
        + `, ${Date.now()});`;
      this.db?.run(sql,
        (err) => {
          if (err) {
            console.error(err);
            console.log(sql);
            resolve(false);
          } else {
            resolve(true);
          }
        });
    });
  }

  selectCommentFrom(aid: string): Promise<CommentNP[]> {
    return new Promise<CommentNP[]>((resolve) => {
      this.db?.all(
        `SELECT * FROM comments WHERE aid = ${escape.sql(aid)};`,
        (err, rows) => {
          if (err) {
            console.error(err);
            resolve([]);
          } else {
            resolve(rows.map((v) => ({
              aid: v.aid,
              id: v.id,
              name: v.name,
              text: v.text,
              time: v.time,
            })));
          }
        },
      );
    });
  }

  deleteComment(id:number, passwd: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const sql = `DELETE FROM comments WHERE id=${id} AND passwd=${escape.sql(passwd)}`;
      this.db?.run(sql,
        function (err) {
          if (err) {
            console.log(err);
            console.log(sql);
            resolve(false);
          } else {
            resolve(this.changes !== 0);
          }
        });
    });
  }

  close():void {
    this.db?.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      return console.log('DB closed.');
    });
  }
}
