import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateRoleDto } from '../src/roles/dto/create-role.dto';
import { UpdateRoleDto } from '../src/roles/dto/update-role.dto';
import { RolesController } from '../src/roles/roles.controller';
import { RolesService } from '../src/roles/roles.service';

describe('RolesController (e2e)', () => {
    let app: INestApplication;
    let rolesService: RolesService;

    const mockRole = {
        id: '66f4237486d300545d3b1f11',
        role: 'Admin',
        active: true,
        permissionIds: ['66f4237486d300545d3b1f10'],
    };

    const mockUser = {
        id: '66f4237486d300545d3b1f13',
        username: 'testuser',
        email: 'test@example.com',
        password: 'securePassword123',
        roleId: null,
    };

    let roles = [mockRole]; // Holds the initial state of roles

    const mockRolesService = {
        create: jest.fn().mockResolvedValue(mockRole),
        findAll: jest.fn().mockImplementation(() => Promise.resolve(roles)),
        findOne: jest.fn().mockImplementation(id => Promise.resolve(roles.find(role => role.id === id))),
        update: jest.fn().mockImplementation((id, updateDto) => {
            const roleIndex = roles.findIndex(role => role.id === id);
            roles[roleIndex] = { ...roles[roleIndex], ...updateDto };
            return Promise.resolve(roles[roleIndex]);
        }),
        remove: jest.fn().mockImplementation(id => {
            roles = roles.filter(role => role.id !== id);
            return Promise.resolve();
        }),
        assignUserToRole: jest.fn().mockResolvedValue({ message: 'User assigned to role successfully' }),
    };
    

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [RolesController],
            providers: [
                {
                    provide: RolesService,
                    useValue: mockRolesService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create a new role', async () => {
        const createRoleDto: CreateRoleDto = {
            role: 'Admin',
            active: true,
            permissionIds: ['66f4237486d300545d3b1f10'],
        };

        const response = await request(app.getHttpServer())
            .post('/roles')
            .send(createRoleDto)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.role).toEqual(createRoleDto.role);
        expect(response.body.active).toEqual(createRoleDto.active);
    });

    it('should retrieve all roles', async () => {
        const response = await request(app.getHttpServer())
            .get('/roles')
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].role).toEqual(mockRole.role);
    });

    it('should retrieve a role by ID', async () => {
        const response = await request(app.getHttpServer())
            .get(`/roles/${mockRole.id}`)
            .expect(200);

        expect(response.body.id).toEqual(mockRole.id);
        expect(response.body.role).toEqual(mockRole.role);
    });

    it('should update a role', async () => {
        const updateRoleDto: UpdateRoleDto = {
            role: 'SuperAdmin',
            active: false,
        };

        const response = await request(app.getHttpServer())
            .put(`/roles/${mockRole.id}`)
            .send(updateRoleDto)
            .expect(200);

        expect(response.body.role).toEqual(updateRoleDto.role);
        expect(response.body.active).toEqual(updateRoleDto.active);
    });

    it('should delete a role', async () => {
        await request(app.getHttpServer())
            .delete(`/roles/${mockRole.id}`)
            .expect(404);

        const response = await request(app.getHttpServer())
            .get(`/roles/${mockRole.id}`)
            .expect(404);

        expect(response.body.message).toEqual(`Role with ID ${mockRole.id} not found`);
    });

    it('should assign a user to a role', async () => {
        const response = await request(app.getHttpServer())
            .post(`/roles/${mockUser.id}/assign`)
            .send({ roleId: mockRole.id })
            .expect(201);

        expect(response.body.message).toEqual('User assigned to role successfully');
    });
});
