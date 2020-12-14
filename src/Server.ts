import http from 'http';
import express from 'express';
import DA from './DA';
import escape from './escape';
import Filter from './Filter';

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

  private filter: Filter

  constructor(port:number) {
    this.filter = new Filter();
    this.da = new DA();
    this.da.open().then(() => {
      this.app = express();
      this.app.use((req, res, next) => {
        res.append('Access-Control-Allow-Origin', ['*']);
        res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.append('Access-Control-Allow-Headers', 'Content-Type');
        res.append('Content-Type', 'application/json');
        next();
      });
      this.app.use(express.json());
      this.setRoute();
      this.server = this.app.listen(port, '127.0.0.1', () => {
        console.log(`Server opened. port: ${port}`);
      });
    });
  }

  private setRoute():void {
    this.app?.route('/api/comments')
      .get((req, res) => {
        this.da.selectCommentFrom(req.query.aid as string).then(
          (comments) => {
            const escaped = comments.map((v) => ({
              id: v.id,
              aid: v.aid,
              name: escape.html(v.name),
              text: escape.html(v.text),
              time: v.time,
            }));
            res.json(escaped);
          },
        );
      })
      .post((req, res) => {
        const cmtReq = req.body as CommentRequest;
        if (!this.filter.checkText(cmtReq.text)) {
          res.status(500);
          res.json({
            msg: '올바른 내용을 입력하세요.',
          });
          return;
        }

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!this.filter.checkIP(ip as string)) {
          res.status(500);
          res.json({
            msg: '잠시 후 다시 시도하세요.',
          });
          return;
        }

        cmtReq.name = this.filter.filterName(cmtReq.name);

        this.da.insertComment(cmtReq).then((v) => {
          if (v) {
            res.status(200);
            res.json({ msg: '댓글을 등록했습니다.' });
            console.log(`post ${cmtReq.aid} / ${cmtReq.name}: ${cmtReq.passwd}\n${cmtReq.text}`);
          } else {
            res.status(400);
            res.json({ msg: '댓글을 등록하지 못했습니다.' });
          }
        });
      })
      .delete((req, res) => {
        this.da.deleteComment(Number(req.query.id),
          req.query.passwd as string).then((v) => {
          if (v) {
            res.status(200);
            res.json({ msg: '댓글을 삭제했습니다.' });

            console.log(`delete ${req.query.id}`);
          } else {
            res.status(400);
            res.json({ msg: '댓글을 삭제하지 못했습니다.' });
          }
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
