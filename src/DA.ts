import sqlite3 = require('sqlite3');

interface Comment{
  aid: string
  name: string
  passwd: string
  text: string
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
        + `'${cmt.aid}','${cmt.name}','${cmt.passwd}','${cmt.text}'`
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

  selectCommentFrom(aid: string): Promise<Comment[]> {
    return new Promise<Comment[]>((resolve) => {
      this.db?.all(
        `SELECT * FROM comments WHERE aid = '${aid}';`,
        (err, rows) => {
          if (err) {
            console.error(err);
            resolve([]);
          } else {
            resolve(rows);
          }
        },
      );
    });
  }

  deleteComment(id:number, passwd: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const sql = `DELETE FROM comments WHERE id=${id} AND passwd='${passwd}'`;
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
