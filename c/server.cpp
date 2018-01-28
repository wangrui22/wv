#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <netinet/in.h>
#include <unistd.h>
#include <libgen.h>

struct Header {
    int id;
    int len;
    int para0;
    int para1;
};

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

    err = listen(fd, 5);
    if (0 != err) {
        printf("server listen failed. err: %d\n",err);
        close(fd);
        return -1;
    }

    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);
    int client_fd = accept(fd, (struct sockaddr*)&client_addr, &addr_len);
    if (client_fd < 0) {
        printf("server accept client failed. err: %d\n",err);
        close(fd);
        close(client_fd);
        return -1;
    }

    printf("client connected.\n");

    while(true) {
        Header header;
        err = recv(client_fd, &header, sizeof(header), MSG_WAITALL);
        if (err < 0) {
            printf("server recv header failed. err: %d\n",err);
            close(fd);
            close(client_fd);
            return -1;
        }
        
        printf("header ID: %d\n", header.id);

        //send image
        if (header.id == 1) {
            //read file
            FILE *f = fopen("../data/mpr.jpeg", "r");
            if(NULL == f) {
                printf("read file failed.\n");
                close(fd);
                return -1;
            }
            fseek(f, 0L, SEEK_END);
            size_t len = (size_t)ftell(f);
            fseek(f, 0L, SEEK_SET);
            if (len == 0) {
                printf("empty file.\n");
                fclose(f);
                close(fd);
                close(client_fd);
                return -1;
            }
            
            char* buffer = (char*)malloc(len);
            if (NULL == buffer) {
                printf("malloc %d byte failed.\n",(int)len);
                fclose(f);
                close(fd);
                close(client_fd);
                return -1;
            }

            if( len != fread(buffer, 1, len, f)) {
                printf("read file failed.\n");
                fclose(f);
                close(fd);
                close(client_fd);
                return -1;
            }

            fclose(f);

            const Header res_header = {1,(int)len,512,512};
            err = send(client_fd, &res_header, sizeof(res_header), 0);
            if (-1 == err) {
                printf("send header failed.\n");
                close(fd);
                close(client_fd);
                return -1;
            }

            err = send(client_fd, buffer, len, 0);
            if (-1 == err) {
                printf("send data failed.\n");
                close(fd);
                close(client_fd);
                return -1;
            }

            free(buffer);
        }
    }

    return 0;
}