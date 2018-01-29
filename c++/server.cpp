#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <netinet/in.h>
#include <unistd.h>
#include <libgen.h>

#include <boost/thread/thread.hpp>

//TODO 信息头的参数可以增加，但同时web端的解包也需要相应的修改MSG_HEADER_LEN大小
struct Header {
    int id;//cmd id
    int len;//package length
    int para0;//web->server is page, server->web can be width
    int para1;
};

//----------------//
//TODO 这里可以写CPU渲染+jpeg压缩的代码
//----------------//
inline char* get_buffer(int page, size_t* buffer_len) {
    FILE *f = NULL;

    if (page == 0) {
        f = fopen("../data/mpr-0.jpeg", "r");
    } else {
        f = fopen("../data/mpr-1.jpeg", "r");
    }

    if(NULL == f) {
        printf("read file failed.\n");
        return NULL;
    }
    fseek(f, 0L, SEEK_END);
    size_t len = (size_t)ftell(f);
    fseek(f, 0L, SEEK_SET);
    if (len == 0) {
        printf("empty file.\n");
        fclose(f);
        return NULL;
    }
    
    char* buffer = (char*)malloc(len);
    if (NULL == buffer) {
        printf("malloc %d byte failed.\n",(int)len);
        fclose(f);
        return NULL;
    }
    
    if( len != fread(buffer, 1, len, f)) {
        printf("read file failed.\n");
        fclose(f);
        return NULL;
    }
    
    fclose(f);

    *buffer_len = len;
    return buffer;
}

void client_runner(int client_fd) {
    int err = 0;
    while(true) {
        Header header;
        err = recv(client_fd, &header, sizeof(header), MSG_WAITALL);
        if (err <= 0) {
            printf("client %d: recv header failed. err: %d\n", client_fd, err);
            break;
        }
        
        printf("client %d: recv request. header ID: %d.\n", client_fd, header.id);

        //send image
        if (header.id == 1) {        

            size_t len = 0;
            char* buffer = get_buffer(header.para0, &len);
            if (!buffer) {
                break;
            }

            const Header res_header = {1,(int)len,512,512};
            err = send(client_fd, &res_header, sizeof(res_header), 0);
            if (-1 == err) {
                printf("client %d: send header failed.\n", client_fd);
                free(buffer);
                break;
            }


            err = send(client_fd, buffer, len, 0);
            if (-1 == err) {
                printf("client %d: send data failed.\n", client_fd);
                free(buffer);
                break;
            }

            free(buffer);
        }
    }

    close(client_fd);
    printf("client %d disconnect.\n", client_fd);
}

int main(int argc , char* argv[2]) {
    if (chdir(dirname(argv[0]))) {

    }

    if (argc != 2) {
        printf("lack of port.\n");
        return -1;
    }
    const char* port = argv[1];
    printf("server run. port: %s.\n", port);

    //create server
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd <= 0) {
        printf("create socket failed.\n");
        return -1;
    }
    
    struct sockaddr_in addr;
    bzero((char*)&addr, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(atoi(port));

    int err = bind(fd, (struct sockaddr *)&addr, sizeof(addr));
    if (err < 0 ) {
        printf("server bind failed. err: %d\n",err);
        close(fd);
        return -1;
    }

    err = listen(fd, 20);
    if (0 != err) {
        printf("server listen failed. err: %d\n",err);
        close(fd);
        return -1;
    }

    while(true) {
        struct sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);
        int client_fd = accept(fd, (struct sockaddr*)&client_addr, &addr_len);
        if (client_fd < 0) {
            printf("server accept client failed. err: %d\n",err);
            close(client_fd);
            continue;
        }

        boost::thread th(boost::bind(client_runner, client_fd));
        th.detach();
    }

    return 0;
}