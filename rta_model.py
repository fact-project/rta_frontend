from peewee import SqliteDatabase, Model, IntegerField, CharField, FloatField, DateTimeField, CompositeKey, ForeignKeyField
import os

path = os.environ.get('RTA_SQLITE_PATH', '/scratch/rta/rta.sqlite')
print('Path to the sqlite db is {}'.format(path))
if not os.access(path, os.W_OK):
    print('Could not read sqlite file')
    raise IOError('could not read sqlite file')

database = SqliteDatabase(path, **{})


class BaseModel(Model):
    class Meta:
        database = database


class FactRun(BaseModel):
    end_time = DateTimeField(null=True)
    health = CharField(null=True)
    night = IntegerField()
    on_time = FloatField(null=True)
    run = IntegerField(db_column='run_id')
    source = CharField(null=True)
    start_time = DateTimeField(null=True)

    class Meta:
        db_table = 'fact_run'
        indexes = (
            (('night', 'run'), True),
        )
        primary_key = CompositeKey('night', 'run')


class Signal(BaseModel):
    analysis_timestamp = DateTimeField(null=True)
    estimated_energy = FloatField()
    event_timestamp = DateTimeField(null=True, primary_key=True)
    night = ForeignKeyField(db_column='night', rel_model=FactRun, to_field='night')
    prediction = FloatField()
    run = ForeignKeyField(db_column='run_id', rel_model=FactRun, related_name='fact_run_run_set', to_field='run')
    theta_off_1 = FloatField(null=True)
    theta_off_2 = FloatField(null=True)
    theta_off_3 = FloatField(null=True)
    theta_off_4 = FloatField(null=True)
    theta_off_5 = FloatField(null=True)
    theta_on = FloatField()

    class Meta:
        db_table = 'signal'
