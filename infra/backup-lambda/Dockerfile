FROM public.ecr.aws/lambda/python:3.11

# Necesitamos pg_dump dentro del contenedor
RUN yum install -y postgresql && yum clean all

# Dependencias Python (boto3 ya viene en Lambda normalmente, pero no pasa nada si lo pones)
COPY requirements.txt .
RUN pip install -r requirements.txt -t .

# Código de la Lambda
COPY app.py .

# Tu handler (ajusta si tu función se llama distinto)
CMD ["app.handler"]
