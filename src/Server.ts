import http from 'http';
import express from 'express';
import DA from './DA';

interface CommentRequest{
  aid: string
  name: string
  passwd: string
  text: string
}

export default class Server {
  private app: express.Express | undefined

  private server: http.Server | undefined

  private da: DA

  constructor(port:number) {
    this.da = new DA();
    this.da.open().then(() => {
      this.app = express();
      this.app.use(express.json());
      this.setRoute();
      this.server = this.app.listen(port, () => {
        console.log(`Server opened. port: ${port}`);
      });
    });
  }

  private setRoute():void {
    this.app?.route('/api/comments')
      .get((req, res) => {
        this.da.selectCommentFrom(req.query.aid as string).then(
          (comments) => {
            res.send(JSON.stringify(comments));
            console.log(`get '${req.query.aid}`);
          },
        );
      })
      .post((req, res) => {
        const cmtReq = req.body as CommentRequest;
        this.da.insertComment(cmtReq).then((v) => {
          if (v) {
            res.status(200);
            console.log(`post ${cmtReq.aid} / ${cmtReq.name}: ${cmtReq.passwd}\n${cmtReq.text}`);
          } else {
            res.status(400);
          }
          res.send('.');
        });
      })
      .delete((req, res) => {
        this.da.deleteComment(Number(req.query.id),
          req.query.passwd as string).then((v) => {
          if (v) {
            res.status(200);
            console.log(`delete ${req.query.id}`);
          } else {
            res.status(400);
          }
          res.send('.');
        });
      });
  }

  close():void {
    this.server?.close((err) => {
      if (err) {
        return console.log(err.message);
      }
      return console.log('Server closed.');
    });
  }
}
