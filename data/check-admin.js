const {Pool}=require('pg');
const p=new Pool({connectionString:'postgresql://neondb_owner:npg_iUfsE32CuQql@ep-proud-unit-atlclkm8.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',ssl:{rejectUnauthorized:false}});
(async()=>{
  const r=await p.query("SELECT permissions FROM role_perms WHERE role='admin'");
  const perms=r.rows[0].permissions;
  const keys=Object.keys(perms).sort();
  console.log('Admin has',keys.length,'pages');
  keys.forEach(k=>{
    const x=perms[k];
    console.log('  '+k+': v='+x.v+' a='+x.a+' e='+x.e+' d='+x.d+' x='+x.x);
  });
  await p.end();
})();
