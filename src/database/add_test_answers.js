
// 직접 답변 추가를 위한 간단한 스크립트
const mysql = require('mysql2/promise');

async function addTestAnswers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // DB 사용자명에 맞게 수정
    password: '', // DB 비밀번호에 맞게 수정  
    database: 'your_database_name' // DB 이름에 맞게 수정
  });

  const answers = [
    {
      content: '이 SignalR 문제를 해결하려면 다음 단계를 시도해보세요:\n\n1. **CORS 설정 확인**: ASP.NET Core에서 CORS가 올바르게 설정되어 있는지 확인하세요.\n2. **포트 및 URL 확인**: https://127.0.0.1:63349/downloadHub에서 서버가 실제로 실행되고 있는지 확인하세요.\n3. **WebSocket 전송 방식**: SignalR 구성에서 WebSocket을 명시적으로 활성화했는지 확인하세요.',
      votes: 2,
      accepted: 1,
      question_id: 6,
      user_id: 18
    },
    {
      content: 'Angular v19와 SignalR를 함께 사용할 때 자주 발생하는 문제입니다. 다음 해결책을 시도해보세요:\n\n',
      votes: 1,
      accepted: 0,
      question_id: 6,
      user_id: 19
    }
  ];

  for (const answer of answers) {
    await connection.execute(
      'INSERT INTO answers (content, votes, accepted, question_id, user_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [answer.content, answer.votes, answer.accepted, answer.question_id, answer.user_id]
    );
  }

  // 질문의 답변 수 업데이트
  await connection.execute('UPDATE questions SET answers = 2 WHERE id = 6');

  console.log('테스트 답변이 추가되었습니다\!');
  await connection.end();
}

addTestAnswers().catch(console.error);
