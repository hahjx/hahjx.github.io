# nginx配置

## 写nginx配置的网站
https://www.digitalocean.com/community/tools/nginx?global.app.lang=zhCN

## 最基础的nginx配置
```
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen       80;
        server_name  localhost;

        # 托管前端 Vue
        location / {
            root   /usr/share/nginx/html;
            index  index.html;
            try_files $uri $uri/ /index.html;
        }

        # 代理后端 Spring Boot
        location /api/ {
            proxy_pass http://172.17.0.1:8080;
        }
    }
}
```

- `root   /usr/share/nginx/html;`所以这行 location的root的意思是，托管容器内部的路径，到时候敲docker命令的时候使用-v连接到lnux宿主机里面是吗？
  ```
    nginx.conf 里的 root 负责告诉 Nginx “去容器内的哪个路径找网页”，而 docker run 命令里的
     -v 负责把“容器内的那个路径”与“Linux 宿主机的真实路径”连通起来。
  ```
  相当于，nginx在容器里面，它访问配置文件的时候，访问容器里面的路径(/usr/share/nginx/html; 这个路径是docker里面nginx的标准路径)；然后通过-v的卷volume映射到真实的宿主机存储
  链路：浏览器browser=>nginx==>nginx容器内部的位置（nginx.config的root字段）=>宿主机的真实位置（docker run -v的映射）

- 为什么后端代理要多一个 /api/
  ```
  Q:我可以说 nginx为了区别前后端请求，后端代理需要一个特殊标识比如 /api ,这个可以配合springboot的统一前缀使用，是吗？
  A:总结起来就是：
    对于 Nginx 来说：它需要一个明确的特殊标识（比如 /api 或 /backend）作为“分流开关”，
    用来区分哪些请求是找前端静态页面（如 /），哪些请求需要转发给后端。
    对于 Spring Boot 来说：你可以配合使用 server.servlet.context-path: /api 
    给后端所有接口加上这个统一前缀。
  注意：proxy_pass的最后面不要写/,不然会把/api去掉导致无法代理，然后locoal的/api推荐写成/api/
  ```


```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        # 1. 托管 Vue 前端静态资源
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            # 关键：解决 Vue History 模式刷新页面报 404 的问题
            try_files $uri $uri/ /index.html;
        }

        # 2. 反向代理 Spring Boot 后端接口（解决跨域）
        location /api/ {
            # 这里的 172.17.0.1 是 Docker 默认网桥地址，代表访问宿主机的 8080 端口（即你的 Spring Boot 服务）
            proxy_pass http://172.17.0.1:8080/; 
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

路线：部署springboot；编写docker file；查看容器内的镜像路径；部署前端

