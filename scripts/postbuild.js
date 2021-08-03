import replace from 'replace';

replace({
  regex: 'query: new URLSearchParams(.+),',
  replacement: 'query: new URLSearchParams(location.search),',
  paths: ['build'],
  recursive: true,
});
