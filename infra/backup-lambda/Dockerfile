FROM public.ecr.aws/lambda/python:3.11

RUN yum install -y curl ca-certificates && yum clean all && \
    curl -fsSL -o /tmp/pgdg.rpm https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
    rpm -i --nodeps /tmp/pgdg.rpm && \
    # Parchea SOLO PGDG para que no intente rhel-2
    sed -i 's|/rhel-\$releasever-|/rhel-7-|g' /etc/yum.repos.d/pgdg*.repo && \
    # Instala usando SOLO pgdg15 (evita pgdg12 que 404)
    yum install -y --disablerepo="pgdg*" --enablerepo="pgdg15,pgdg-common" postgresql15 && \
    yum clean all

ENV PATH="/usr/pgsql-15/bin:${PATH}"

COPY requirements.txt .
RUN pip install -r requirements.txt -t .

COPY app.py .

RUN pg_dump --version

CMD ["app.handler"]
